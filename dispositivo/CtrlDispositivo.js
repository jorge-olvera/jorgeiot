import { DaoEntradaDispositivo } from "./DaoEntradaDispositivo.js";
import { DaoHistorialDispositivo } from "./DaoHistorialDispositivo.js";
import { DaoSalidaDispositivo } from "./DaoSalidaDispositivo.js";
import { espera } from "./utilIoT.js";
const INTERVALO_EN_MILIS = 1000;

export class CtrlDispositivo {
  /**
   * @param {string} idDisp
   * @param {() => boolean} sondeaSalida
   * @param {(valor: number) => void} muestraSalida
   * @param {() => number} recuperaEntrada
   * @param {(valor: Error) => void} muestraError
   * @param {DaoHistorialDispositivo} daoHistorial
   * @param {DaoEntradaDispositivo} daoEntrada
   * @param {DaoSalidaDispositivo} daoSalida
   */
  constructor(idDisp, sondeaSalida, muestraSalida, recuperaEntrada,
    muestraError, daoHistorial, daoEntrada, daoSalida) {
    this._idDisp = idDisp;
    this._entrada = null;
    this._sondeaSalida = sondeaSalida;
    this._muestraSalida = muestraSalida;
    this._recuperaEntrada = recuperaEntrada;
    this._muestraError = muestraError;
    this._daoHistorial = daoHistorial;
    this._daoEntrada = daoEntrada;
    this._daoSalida = daoSalida;
  }
  async setup() {
    this._entrada = 0;
    await this._muestraLaSalidaDelServidor();
    await this._envíaLaEntrada(true);
  }
  async loop() {
    await this._muestraLaSalidaDelServidor();
    await this._envíaLaEntrada(false);
    await espera(INTERVALO_EN_MILIS);
  }
  async _muestraLaSalidaDelServidor() {
    try {
      if (this._sondeaSalida()) {
        const salida = await this._daoSalida.busca();
        this._muestraSalida(salida);
      }
    } catch (error) {
      this._muestraSalida(0);
      this._muestraError(error);
    }
  }
  /**
   * @param {boolean} forzosa
   */
  async _envíaLaEntrada(forzosa) {
    try {
      const nuevaEntrada = this._recuperaEntrada();
      if (forzosa || this._entrada != nuevaEntrada) {
        this._daoEntrada.modifica(nuevaEntrada);
        this._daoHistorial.agrega(nuevaEntrada);
        this._entrada = nuevaEntrada;
      }
    } catch (e) {
      this._muestraError(e);
    }
  }
}