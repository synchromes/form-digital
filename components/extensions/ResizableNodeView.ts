import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Editor } from '@tiptap/core'
import { NodeView } from '@tiptap/pm/view'

export class ResizableNodeView implements NodeView {
    dom: HTMLElement
    contentDOM: HTMLElement
    node: ProseMirrorNode
    getPos: () => number | undefined
    editor: Editor
    handle: HTMLElement | null = null

    constructor(node: ProseMirrorNode, view: any, getPos: () => number | undefined, editor: Editor) {
        this.node = node
        this.getPos = getPos
        this.editor = editor

        const isHeader = node.type.name === 'tableHeader'
        this.dom = document.createElement(isHeader ? 'th' : 'td')
        this.contentDOM = document.createElement('div')

        // Setup basic styles
        this.dom.style.position = 'relative'
        this.dom.style.minWidth = '50px'
        this.dom.style.verticalAlign = 'top'
        this.dom.style.border = '1px solid #d1d5db'
        this.dom.style.padding = '4px 8px' // Reduced padding for tighter rows

        if (isHeader) {
            this.dom.style.backgroundColor = '#f3f4f6'
            this.dom.style.fontWeight = 'bold'
        }

        // Apply initial height
        this.updateHeight(node.attrs.height)

        // Append content container
        // We use a div for contentDOM to ensure proper editing behavior
        this.contentDOM.style.height = '100%'
        this.contentDOM.style.outline = 'none'
        this.dom.appendChild(this.contentDOM)

        // Add resize handle
        this.createHandle()

        // Add classes
        if (node.attrs.class) {
            this.dom.className = node.attrs.class
        }
    }

    updateHeight(height: string | null) {
        if (height) {
            this.dom.style.height = height
        } else {
            this.dom.style.height = 'auto'
        }
    }

    createHandle() {
        this.handle = document.createElement('div')
        this.handle.contentEditable = 'false'
        this.handle.style.position = 'absolute'
        this.handle.style.bottom = '-1px'
        this.handle.style.left = '0'
        this.handle.style.right = '0'
        this.handle.style.height = '6px'
        this.handle.style.cursor = 'row-resize'
        this.handle.style.zIndex = '10'
        this.handle.style.opacity = '0'
        this.handle.style.transition = 'opacity 0.2s'

        // Hover effect
        this.handle.addEventListener('mouseenter', () => {
            if (this.handle) this.handle.style.opacity = '1'
            if (this.handle) this.handle.style.backgroundColor = '#60a5fa' // blue-400
        })
        this.handle.addEventListener('mouseleave', () => {
            if (this.handle) this.handle.style.opacity = '0'
            if (this.handle) this.handle.style.backgroundColor = 'transparent'
        })

        this.handle.addEventListener('mousedown', this.onMouseDown.bind(this))

        this.dom.appendChild(this.handle)
    }

    onMouseDown(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        const startY = e.clientY
        let startHeight = this.dom.offsetHeight

        // Try to parse current height from style if possible, otherwise use offsetHeight
        const styleHeight = this.dom.style.height
        if (styleHeight && styleHeight.endsWith('px')) {
            startHeight = parseInt(styleHeight)
        }

        const onMouseMove = (e: MouseEvent) => {
            const delta = e.clientY - startY
            const newHeight = Math.max(10, startHeight + delta) // Min height 10px
            this.dom.style.height = `${newHeight}px`
        }

        const onMouseUp = (e: MouseEvent) => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)

            const delta = e.clientY - startY
            if (Math.abs(delta) > 1) {
                const finalHeight = Math.max(10, startHeight + delta) // Min height 10px
                this.updateRowHeight(finalHeight)
            } else {
                // Revert if no drag
                this.update(this.node)
            }
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    updateRowHeight(height: number) {
        if (typeof this.getPos !== 'function') return

        const pos = this.getPos()
        if (pos === undefined) return

        const { state, view } = this.editor
        const tr = state.tr
        const $pos = state.doc.resolve(pos)

        // Find row
        let rowDepth = -1
        for (let d = $pos.depth; d > 0; d--) {
            if ($pos.node(d).type.name === 'tableRow') {
                rowDepth = d
                break
            }
        }

        if (rowDepth >= 0) {
            const rowNode = $pos.node(rowDepth)
            const rowStart = $pos.start(rowDepth)

            rowNode.forEach((child, offset) => {
                if (child.type.name === 'tableCell' || child.type.name === 'tableHeader') {
                    const cellPos = rowStart + offset
                    tr.setNodeMarkup(cellPos, undefined, {
                        ...child.attrs,
                        height: `${height}px`
                    })
                }
            })
            view.dispatch(tr)
        }
    }

    update(node: ProseMirrorNode) {
        if (node.type !== this.node.type) return false
        this.node = node
        this.updateHeight(node.attrs.height)
        if (node.attrs.class) {
            this.dom.className = node.attrs.class
        }
        return true
    }

    stopEvent(event: Event) {
        // Don't stop events in the content, but stop events in the handle
        if (this.handle && this.handle.contains(event.target as Node)) {
            return true
        }
        return false
    }

    ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
        // Ignore mutations to the handle or style changes we triggered
        if (mutation.type === 'selection') return false

        if (mutation.target === this.handle || this.handle?.contains(mutation.target as Node)) {
            return true
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            return true
        }
        return false
    }
}
