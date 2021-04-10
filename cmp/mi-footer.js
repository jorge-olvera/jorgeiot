class MiFooter
  extends HTMLElement {
  connectedCallback() {
    this.innerHTML = /* html */
      `&copy; 2021
      Jorge Olvera Martinez.`;
  }
}
customElements.define(
  "mi-footer", MiFooter);