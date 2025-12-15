import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';

import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import * as React from 'react';
import { Suspense } from 'react';
import { ImageComponent } from './ImageComponent';

export interface ImagePayload {
    altText: string;
    src: string;
    imageId: string;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
    const img = domNode as HTMLImageElement;

    const node = $createImageNode({ altText: img.alt, src: img.src, imageId: img.getAttribute('data-image-id') || '' });
    return { node };
}

export type SerializedImageNode = Spread<
    {
        altText: string;
        src: string;
        imageId: string;
    },
    SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.ReactElement> {
    __src: string;
    __altText: string;
    __imageId: string;

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__altText, node.__imageId, node.__key);
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, src, imageId } = serializedNode;
        const node = $createImageNode({
            altText,
            src,
            imageId,
        });
        return node;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.className = 'image-wrapper';

        const img = document.createElement('img');
        img.setAttribute('src', this.__src);
        img.setAttribute('alt', this.__altText);
        if (this.__imageId) {
            img.setAttribute('data-image-id', this.__imageId);
        }

        const span = document.createElement('span');
        span.className = 'image-alt';
        span.textContent = this.__altText;

        element.appendChild(img);
        element.appendChild(span);

        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: convertImageElement,
                priority: 0,
            }),
        };
    }

    constructor(src: string, altText: string, imageId: string, key?: NodeKey) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__imageId = imageId;
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.getAltText(),
            src: this.getSrc(),
            imageId: this.__imageId,
            type: 'image',
            version: 1,
        };
    }

    setAltText(altText: string): void {
        const writable = this.getWritable();
        writable.__altText = altText;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): false {
        return false;
    }

    getSrc(): string {
        return this.__src;
    }

    getId(): string {
        return this.__imageId!;
    }

    getAltText(): string {
        return this.__altText;
    }

    decorate(): React.ReactElement {
        return (
            <Suspense fallback={null}>
                <ImageComponent
                    src={this.__src}
                    altText={this.__altText}
                    imageId={this.__imageId}
                />
            </Suspense>
        );
    }
}

export function $createImageNode({ altText, src, imageId }: ImagePayload): ImageNode {
    return $applyNodeReplacement(new ImageNode(src, altText, imageId));
}

export function $isImageNode(
    node: LexicalNode | null | undefined,
): node is ImageNode {
    return node instanceof ImageNode;
}