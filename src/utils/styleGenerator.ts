import type { EpubStyle } from '../types';

export const generateStylesheet = (style: EpubStyle) => {
    return `body {
    font-size: ${style.fontSize}px;
    line-height: ${style.lineHeight / 100};
    padding: ${style.margin.top}% ${style.margin.right}% ${style.margin.bottom}% ${style.margin.left}%;
    word-break: break-all;
  }
  blockquote {
    border-left: 0.2em solid gray;
    margin-left: 1em;
    padding-left: 1em;
  }
  blockquote p {
    text-indent: 0;
  }
  p {
    margin: 0;
    margin-bottom: ${style.paragraphSpacing / 100}em;
    text-indent: ${style.indentation ? '2em' : '0'};
  }
  h1 {
    font-size: 1.5em;
  }
  h2 {
    font-size: 1.25em;
  }
  h3 {
    font-size: 1.125em;
  }
  h4 {
    font-size: 1em;
  }
  .image-wrapper {
    margin-bottom: ${style.paragraphSpacing / 100}em;
  }
  img {
    max-width: 100%;
    text-align: center;
  }
  .image-alt {
    display: block;
    font-size: 0.8em;
    text-align: center;
  }
  pre {
    border: 1px solid gray;
    word-wrap: break-word;
    padding: 0.5em;
  }
  code {
    background-color: #f8f8f8;
  }
  table, th, td {
    border: 1px solid;
  }
  th, td {
    padding: 0.2em;
    vertical-align: middle;
  }
`;
};
