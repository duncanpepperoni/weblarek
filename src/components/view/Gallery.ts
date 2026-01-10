import { Component } from "../base/Component";

interface GalleryData {
  catalog: HTMLElement[];
}

export class Gallery extends Component<GalleryData> {
  constructor(container: HTMLElement) {
    super(container);
  }

  set catalog(items: HTMLElement[]) {
    this.container.replaceChildren(...items);
  }
}
