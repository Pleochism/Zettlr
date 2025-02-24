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
import { EditorState } from '@codemirror/state'

const colourArray = [
  "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#14a9ad", "#4ca2f9", "#a4e43f",
  "#d298e2", "#d2737d", "#c0a43c", "#61da5e", "#01ac53", "#c5a4fb", "#4bb473", "#75d89e",
  "#da967d", "#c4d647", "#e0eeb8", "#11dec1", "#0cd36d", "#f697c1", "#ba96ce", "#679c9d",
  "#c6c42c", "#48b41b", "#5be4f0", "#57c4d8", "#a4d17a", "#96b00c", "#f158bf", "#ee91e3",
  "#05d371", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158", "#51aed9", "#5bb32d",
  "#89d534", '#7fb411', "#c79ed2", "#d6dd92", "#b2be57", "#fa06ec", "#1bb699", "#9cb64a",
  "#9ab9b7", "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#cefcb8", "#a5b3d9",
  "#c4fd57", "#f1ae16", "#ef6e3c", "#dd93fd", "#93f2d7", "#15b9ee", "#10e5b1", "#32d5d6",
  "#c79bc2", "#00f87c", "#6995ba", "#96e591", "#21d52e", "#bde052", "#28fcfd", "#1ae6db",
  "#b4c086", "#30cc49", "#88aa0b", "#79bca0", "#a8b8d4", "#00efd4", "#7ad236", "#1deaa7",
  "#06f43a", "#e3d94c", "#2dfff6", "#4cf09d", "#c188a2", "#67eb4b", "#fc7e41", "#71b1f4",
  "#00f7f9", "#3cec35", "#5cdd87", "#e4ac44", "#1bede6", "#8798a4", "#b2c24f", "#de73c2",
  "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#0ec0ff", "#b17fc9", "#2ca1ae", "#9685eb",
  "#8a96c6", "#dba2e6", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"]


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
    let int = 0
    for(let i = 0; i < this.name.length; i++)
      int += this.name.charCodeAt(i)
    const colour = colourArray[int % colourArray.length]

    elem.innerText = this.name
    elem.style.color = colour
    elem.classList.add('rml-character-name')
    elem.style.marginRight = `${Math.max(0, view.state.facet(EditorState.tabSize) - this.name.length + 1)/2}em`
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

    elem.innerText = '〰'
    elem.style.color = 'white'
    elem.style.marginRight = `${Math.max(0, view.state.facet(EditorState.tabSize) - this.name.length + 1)/2}em`
    return elem
  }
}

function shouldHandlePlayerNode (node: SyntaxNodeRef): boolean {
  return node.type.name === 'RmlPlayerName'
}

function createPlayerWidget (state: EditorState, node: SyntaxNodeRef): PlayerWidget|undefined {
  const name = state.sliceDoc(node.from, node.to) // Will be (. )

  return new PlayerWidget(name, node.node)
}

class JumpStartWidget extends WidgetType {
  constructor (readonly name: string, readonly node: SyntaxNode) {
    super()
  }

  eq (other: JumpStartWidget): boolean {
    return other.name === this.name &&
      other.node.from === this.node.from &&
      other.node.to === this.node.to
  }

  toDOM (view: EditorView): HTMLElement {
    const elem = document.createElement('span')

    elem.innerText = '⤵️'
    return elem
  }
}

function shouldHandleJumpStartNode (node: SyntaxNodeRef): boolean {
  return node.type.name === 'RmlBlockJumpStartMark'
}

function createJumpStartWidget (state: EditorState, node: SyntaxNodeRef): JumpStartWidget|undefined {
  const name = state.sliceDoc(node.from, node.to)

  return new JumpStartWidget(name, node.node)
}

class JumpEndWidget extends WidgetType {
  constructor (readonly name: string, readonly node: SyntaxNode) {
    super()
  }

  eq (other: JumpStartWidget): boolean {
    return other.name === this.name &&
      other.node.from === this.node.from &&
      other.node.to === this.node.to
  }

  toDOM (view: EditorView): HTMLElement {
    const elem = document.createElement('span')

    elem.innerText = '⤴️'
    return elem
  }
}

function shouldHandleJumpEndNode (node: SyntaxNodeRef): boolean {
  return node.type.name === 'RmlBlockJumpEndMark'
}

function createJumpEndWidget (state: EditorState, node: SyntaxNodeRef): JumpEndWidget|undefined {
  const name = state.sliceDoc(node.from, node.from)

  return new JumpEndWidget(name, node.node)
}

const renderCharacters = renderInlineWidgets(shouldHandleCharNode, createCharWidget)
const renderPlayer = renderInlineWidgets(shouldHandlePlayerNode, createPlayerWidget)
const renderJumpStart = renderInlineWidgets(shouldHandleJumpStartNode, createJumpStartWidget)
const renderJumpEnd = renderInlineWidgets(shouldHandleJumpEndNode, createJumpEndWidget)

export { renderCharacters, renderPlayer, renderJumpStart, renderJumpEnd }
