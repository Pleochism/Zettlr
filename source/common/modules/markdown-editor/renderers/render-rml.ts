/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        TaskRenderer
 * CVM-Role:        View
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     This renderer displays task lists
 *
 * END HEADER
 */

import { renderInlineWidgets } from './base-renderer'
import { type SyntaxNodeRef, type SyntaxNode } from '@lezer/common'
import { WidgetType, type EditorView } from '@codemirror/view'
import { type EditorState } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'

const colourArray = [
  "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#0d5ac1" ,
  "#f205e6" ,"#14a9ad" ,"#4ca2f9" ,"#a4e43f" ,"#d298e2" ,"#6119d0",
  "#d2737d" ,"#c0a43c" ,"#f2510e" ,"#651be6" ,"#79806e" ,"#61da5e" ,"#cd2f00" ,
  "#9348af" ,"#01ac53" ,"#c5a4fb" ,"#996635", "#b11573" ,"#4bb473" ,"#75d89e" ,
  "#2f3f94" ,"#2f7b99" ,"#da967d" ,"#34891f", "#ca4751" ,"#7e50a8" ,
  "#c4d647" ,"#e0eeb8" ,"#11dec1" ,"#289812" ,"#566ca0",
  "#935b6d" ,"#916988" ,"#513d98", "#9e6d71", "#4b5bdc", "#0cd36d",
  "#cb5bea", "#ac3e1b", "#df514a",
  "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#48b41b",
  "#5be4f0", "#57c4d8", "#a4d17a", "#be608b", "#96b00c", "#088baf",
  "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
  "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
  "#fb21a3", "#51aed9", "#5bb32d", "#21538e", "#89d534", "#d36647",
  "#7fb411", "#986b53", "#983f7a", "#ea24a3",
  "#79352c", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
  "#1bb699", "#6b2e5f", "#64820f", "#21538e", "#89d534", "#d36647",
  "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#983f7a", "#ea24a3",
  "#79352c", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
  "#1bb699", "#64820f", "#9cb64a", "#996c48", "#9ab9b7",
  "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
  "#73872a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
  "#ef6e3c", "#243eeb", "#dd93fd",
  "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee",
  "#409188", "#911e20", "#1350ce", "#10e5b1", "#cb2582",
  "#32d5d6", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
  "#96e591", "#21d52e", "#d00043",
  "#b47162", "#947002", "#bde052",
  "#28fcfd", "#36486a", "#d02e29", "#1ae6db",
  "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#30cc49",
  "#3d6751", "#640fc1", "#d3493a", "#88aa0b", "#406df9",
  "#615af0", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
  "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c",
  "#b46238", "#2dfff6", "#1a8011", "#436a9f", "#1a806a",
  "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101",
  "#71b1f4", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
  "#1c65cb", "#2d7d2a", "#5cdd87", "#a259a4", "#e4ac44",
  "#1bede6", "#8798a4", "#b2c24f", "#de73c2", "#d70a9c",
  "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
  "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
  "#dba2e6", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"];

function getForegroundColour(c) {
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);

  var sum = Math.round(((r * 299) + (g * 587) + (b * 114)) / 1000);
  return (sum > 128) ? 'black' : 'white';
}

class CharacterWidget extends WidgetType {
  constructor (readonly name: string, readonly node: SyntaxNode) {
    super()
  }

  eq (other: CharacterWidget): boolean {
    return other.name === this.name &&
      other.node.from === this.node.from &&
      other.node.to === this.node.to
  }

  toDOM (view: EditorView): HTMLElement {
    const elem = document.createElement('span')

    // Choose a colour based in the name
    let int = 0;
    for(let i = 0; i < this.name.length; i++)
      int += this.name.charCodeAt(i)
    const colour = colourArray[int % colourArray.length]

    elem.innerText = this.name + ' '.repeat(Math.max(0, view.state.facet(indentUnit).length - this.name.length))
    elem.style.color = colour
    return elem
  }
}

function shouldHandleCharNode (node: SyntaxNodeRef): boolean {
  return node.type.name === 'RmlCharacterName'
}

function createCharWidget (state: EditorState, node: SyntaxNodeRef): CharacterWidget|undefined {
  const name = state.sliceDoc(node.from, node.to) // Will be @...

  return new CharacterWidget(name, node.node)
}

class PlayerWidget extends WidgetType {
  constructor (readonly name: string, readonly node: SyntaxNode) {
    super()
  }

  eq (other: PlayerWidget): boolean {
    return other.name === this.name &&
      other.node.from === this.node.from &&
      other.node.to === this.node.to
  }

  toDOM (view: EditorView): HTMLElement {
    const elem = document.createElement('span')

    elem.innerText = '. ' + ' '.repeat(Math.max(0, view.state.facet(indentUnit).length - 1))
    return elem
  }
}

function shouldHandlePlayerNode (node: SyntaxNodeRef): boolean {
  return node.type.name === 'RmlPlayerName'
}

function createPlayerWidget (state: EditorState, node: SyntaxNodeRef): PlayerWidget|undefined {
  const name = state.sliceDoc(node.from, node.to) // Will be (.)

  return new PlayerWidget(name, node.node)
}

const renderCharacters = renderInlineWidgets(shouldHandleCharNode, createCharWidget)
const renderPlayer = renderInlineWidgets(shouldHandlePlayerNode, createPlayerWidget)

export { renderCharacters, renderPlayer }
