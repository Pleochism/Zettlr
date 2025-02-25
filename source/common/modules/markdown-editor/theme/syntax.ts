/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        Syntax Highlighting
 * CVM-Role:        Extension
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     This module defines the syntax highlighting "themes" for
 *                  code and Markdown files.
 *
 * END HEADER
 */

import { tags } from '@lezer/highlight'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { customTags } from '../util/custom-tags'
import { type Extension } from '@codemirror/state'

// Instead of utilizing JS styling, we simply apply class names, in order to
// retain our users' ability to apply custom CSS.
const markdownTheme = HighlightStyle.define([
  { tag: tags.angleBracket, class: 'cm-angle-bracket' },
  { tag: tags.annotation, class: 'cm-annotation' },
  { tag: tags.arithmeticOperator, class: 'cm-arithmetic-operator' },
  { tag: tags.atom, class: 'cm-atom' },
  { tag: tags.attributeName, class: 'cm-attribute-name' },
  { tag: tags.attributeValue, class: 'cm-attribute-value' },
  { tag: tags.bitwiseOperator, class: 'cm-bitwise-operator' },
  { tag: tags.blockComment, class: 'cm-block-comment' },
  { tag: tags.bool, class: 'cm-bool' },
  { tag: tags.brace, class: 'cm-brace' },
  { tag: tags.heading, class: 'cm-heading' },
  { tag: tags.heading1, class: 'cm-header-1' },
  { tag: tags.heading2, class: 'cm-header-2' },
  { tag: tags.heading3, class: 'cm-header-3' },
  { tag: tags.heading4, class: 'cm-header-4' },
  { tag: tags.heading5, class: 'cm-header-5' },
  { tag: tags.heading6, class: 'cm-header-6' },
  { tag: tags.blockComment, class: 'cm-block-comment' },
  { tag: tags.contentSeparator, class: 'cm-hr' },
  { tag: tags.url, class: 'cm-url' },
  { tag: tags.link, class: 'cm-link' },
  { tag: tags.quote, class: 'cm-quote' },
  { tag: tags.list, class: 'cm-list' },
  { tag: tags.monospace, class: 'cm-fenced-code' },
  // Styling for YAML frontmatters
  { tag: customTags.YAMLFrontmatter, class: 'cm-yaml-frontmatter' },
  { tag: customTags.YAMLFrontmatterStart, class: 'cm-yaml-frontmatter-start' },
  { tag: customTags.YAMLFrontmatterEnd, class: 'cm-yaml-frontmatter-end' },
  // NOTE: Changes here must be reflected in util/custom-tags.ts and parser/markdown-parser.ts
  // Codeblocks
  { tag: tags.labelName, class: 'cm-info-string' }, // CodeInfo (info string)
  //{ tag: tags.processingInstruction, class: 'cm-code-mark' }, // CodeMark (i.e. ```) but also table delimiters
  { tag: tags.monospace, class: 'cm-monospace' }, // CodeText (i.e. code block content)
  // Tables TODO
  // Footnotes
  /*{ tag: customTags.Footnote, class: 'footnote' },
  { tag: customTags.FootnoteRef, class: 'footnote-ref' },
  { tag: customTags.FootnoteRefLabel, class: 'footnote-ref-label' },
  { tag: customTags.FootnoteRefBody, class: 'footnote-ref-body' },
  { tag: customTags.ZknLinkContent, class: 'cm-zkn-link' },
  { tag: customTags.ZknTagContent, class: 'cm-zkn-tag' },
  { tag: customTags.PandocAttribute, class: 'pandoc-attribute' },*/
  { tag: customTags.Highlight, class: 'cm-highlight' },
  { tag: customTags.HighlightContent, class: 'cm-highlight' },
  { tag: customTags.HighlightMark, class: 'cm-highlight cm-highlight-mark' },
  { tag: customTags.HighlightContent, class: 'cm-highlight' },

  // RML
  { tag: customTags.RmlConditionalStart, class: 'rml-conditional-start' },
  { tag: customTags.RmlConditionalBranch, class: 'rml-conditional-branch' },
  { tag: customTags.RmlConditionalKeyword, class: 'rml-conditional-keyword' },
  { tag: customTags.RmlPlayer, class: 'rml-player' },
  { tag: customTags.RmlPlayerName, class: 'rml-player-name' },
  { tag: customTags.RmlPlayerText, class: 'rml-player-text' },
  { tag: customTags.RmlPlayerDialogue, class: 'rml-player-dialogue' },
  { tag: customTags.RmlPlayerDialogueItalic, class: 'rml-player-dialogue-italic' },
  { tag: customTags.RmlPlayerNarration, class: 'rml-player-narration' },
  { tag: customTags.RmlPlayerNarrationItalic, class: 'rml-player-narration-italic' },
  { tag: customTags.RmlCharacter, class: 'rml-character' },
  { tag: customTags.RmlCharacterName, class: 'rml-character-name' },
  { tag: customTags.RmlCharacterText, class: 'rml-character-text' },
  { tag: customTags.RmlCharacterDialogue, class: 'rml-character-dialogue' },
  { tag: customTags.RmlCharacterDialogueItalic, class: 'rml-character-dialogue-italic' },
  { tag: customTags.RmlCharacterNarration, class: 'rml-character-narration' },
  { tag: customTags.RmlCharacterNarrationItalic, class: 'rml-character-narration-italic' },
  { tag: customTags.RmlJump, class: 'rml-jump' },
  { tag: customTags.RmlJumpMarker, class: 'rml-jump-marker' },
  { tag: customTags.RmlJumpText, class: 'rml-jump-text' },
  { tag: customTags.RmlCode, class: 'rml-code' },
  { tag: customTags.RmlCodeKeyword, class: 'rml-code-keyword' },
  { tag: customTags.RmlCall, class: 'rml-call' },
  { tag: customTags.RmlChoice, class: 'rml-choice' },
  { tag: customTags.RmlChoiceKeyword, class: 'rml-choice-keyword' },
  { tag: customTags.RmlChoiceItalic, class: 'rml-choice-italic' },
  { tag: customTags.RmlChoiceEmote, class: 'rml-choice-emote' },
  { tag: customTags.RmlBlockJump, class: 'rml-blockjump' },
  { tag: customTags.RmlBlockJumpStart, class: 'rml-blockjump-start' },
  { tag: customTags.RmlBlockJumpEnd, class: 'rml-blockjump-end' },
  { tag: customTags.RmlBlockJumpStartMark, class: 'rml-blockjump-start-mark' },
  { tag: customTags.RmlBlockJumpEndMark, class: 'rml-blockjump-end-mark' },

  // Emphasis
  { tag: tags.emphasis, class: 'cm-emphasis' },
  { tag: tags.strong, class: 'cm-strong' },
])

const codeTheme = HighlightStyle.define([
  { tag: tags.comment, class: 'cm-comment' },
  { tag: tags.lineComment, class: 'cm-line-comment' },
  { tag: tags.blockComment, class: 'cm-block-comment' },
  { tag: tags.docComment, class: 'cm-doc-comment' },
  { tag: tags.name, class: 'cm-name' },
  { tag: tags.variableName, class: 'cm-variable-name' },
  { tag: tags.typeName, class: 'cm-type-name' },
  { tag: tags.tagName, class: 'cm-tag-name' },
  { tag: tags.propertyName, class: 'cm-property-name' },
  { tag: tags.attributeName, class: 'cm-attribute-name' },
  { tag: tags.className, class: 'cm-class-name' },
  { tag: tags.labelName, class: 'cm-label-name' },
  { tag: tags.namespace, class: 'cm-namespace' },
  { tag: tags.macroName, class: 'cm-macro-name' },
  { tag: tags.literal, class: 'cm-literal' },
  { tag: tags.string, class: 'cm-string' },
  { tag: tags.docString, class: 'cm-doc-string' },
  { tag: tags.character, class: 'cm-character' },
  { tag: tags.attributeValue, class: 'cm-attribute-value' },
  { tag: tags.number, class: 'cm-number' },
  { tag: tags.integer, class: 'cm-integer' },
  { tag: tags.float, class: 'cm-float' },
  { tag: tags.bool, class: 'cm-bool' },
  { tag: tags.regexp, class: 'cm-regexp' },
  { tag: tags.escape, class: 'cm-escape' },
  { tag: tags.color, class: 'cm-color' },
  { tag: tags.url, class: 'cm-url' },
  { tag: tags.keyword, class: 'cm-keyword' },
  { tag: tags.self, class: 'cm-self' },
  { tag: tags.null, class: 'cm-null' },
  { tag: tags.atom, class: 'cm-atom' },
  { tag: tags.unit, class: 'cm-unit' },
  { tag: tags.modifier, class: 'cm-modifier' },
  { tag: tags.operatorKeyword, class: 'cm-operator-keyword' },
  { tag: tags.controlKeyword, class: 'cm-control-keyword' },
  { tag: tags.definitionKeyword, class: 'cm-definition-keyword' },
  { tag: tags.moduleKeyword, class: 'cm-module-keyword' },
  { tag: tags.operator, class: 'cm-operator' },
  { tag: tags.derefOperator, class: 'cm-deref-operator' },
  { tag: tags.arithmeticOperator, class: 'cm-arithmetic-operator' },
  { tag: tags.logicOperator, class: 'cm-logic-operator' },
  { tag: tags.bitwiseOperator, class: 'cm-bitwise-operator' },
  { tag: tags.compareOperator, class: 'cm-compare-operator' },
  { tag: tags.updateOperator, class: 'cm-update-operator' },
  { tag: tags.definitionOperator, class: 'cm-definition-operator' },
  { tag: tags.typeOperator, class: 'cm-type-operator' },
  { tag: tags.controlOperator, class: 'cm-control-operator' },
  { tag: tags.punctuation, class: 'cm-punctuation' },
  { tag: tags.separator, class: 'cm-separator' },
  { tag: tags.bracket, class: 'cm-bracket' },
  { tag: tags.angleBracket, class: 'cm-angle-bracket' },
  { tag: tags.squareBracket, class: 'cm-square-bracket' },
  { tag: tags.paren, class: 'cm-paren' },
  { tag: tags.brace, class: 'cm-brace' },
  { tag: tags.content, class: 'cm-content-span' }, // BEWARE to NOT name that ".cm-content"
  { tag: tags.link, class: 'cm-link' },
  { tag: tags.monospace, class: 'cm-monospace' },
  { tag: tags.strikethrough, class: 'cm-strikethrough' },
  { tag: tags.inserted, class: 'cm-inserted' },
  { tag: tags.deleted, class: 'cm-deleted' },
  { tag: tags.changed, class: 'cm-changed' },
  { tag: tags.invalid, class: 'cm-invalid' },
  { tag: tags.meta, class: 'cm-meta' }
])

export function markdownSyntaxHighlighter (): Extension {
  return [ syntaxHighlighting(markdownTheme),
    syntaxHighlighting(codeTheme)
  ]
}

export function codeSyntaxHighlighter (): Extension {
  return syntaxHighlighting(codeTheme)
}
