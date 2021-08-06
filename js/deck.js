// @ts-check
import { mostraAzioni, mostraCarte } from './view.js';

/**
 * Mappatura carte criteri
 * @type {string[]}
 */
export const carteCriteri = [];
carteCriteri['1'] = 'A_B_E_1_G_I_J_1A_Q_M_N_5_ABC';
carteCriteri['2'] = 'E_A_C_5_H_J_I_10A_N_M_Q_12_CDA';
carteCriteri['3'] = 'D_A_B_2_I_J_G_5B_M_N_Q_9_BCD';
carteCriteri['4'] = 'E_A_D_5_H_I_J_9A_N_M_Q_8_ABC';
carteCriteri['5'] = 'A_B_C_4_G_J_I_2B_R_M_N_11_DAB';
carteCriteri['6'] = 'A_B_E_6_J_I_G_3A_P5_M_N_5_DCB';
carteCriteri['7'] = 'D_A_B_1_I_J_G_5A_M_N_Q_8_ABC';
carteCriteri['8'] = 'A_B_C_9_J_I_G_4B_OP_M_N_12_CBA';
carteCriteri['9'] = 'E_A_F_10_H_I_J_9B_N_M_Q_11_CBA';
carteCriteri['10'] = 'A_B_D_7_J_I_G_3B_P6_M_N_6_CBA';
carteCriteri['11'] = 'A_B_F_8_J_I_G_4A_P7_M_N_7_BAD';
carteCriteri['12'] = 'D_B_A_7_K_H_J_7B_M_N_Q_11_CBA';
carteCriteri['13'] = 'D_B_A_6_K_H_J_7A_M_N_Q_10_DCB';
carteCriteri['14'] = 'C_A_B_8_L_H_K_8A_M_N_Q_11_BAD';
carteCriteri['15'] = 'A_B_D_2_G_I_J_1B_Q_M_N_6_BCD';
carteCriteri['16'] = 'F_B_A_3_I_J_G_6A_M_N_Q_9_CDA';
carteCriteri['17'] = 'A_B_F_3_G_J_I_2A_R_M_N_7_CDA';
carteCriteri['18'] = 'C_A_B_9_L_H_K_8B_N_M_Q_12_CBA';
carteCriteri['19'] = 'E_A_C_10_H_J_I_10B_N_M_Q_12_DAB';
carteCriteri['20'] = 'F_B_A_4_I_J_G_6B_M_N_Q_10_DAB';

/**
 * Mappatura carte azione
 * @type {string[]}
 */
export const carteAzioni = [];
carteAzioni['1'] = 'X_X_CD_CE_X_X_X_X';
carteAzioni['2'] = 'X_CCO_CAP_X_X_X_X';
carteAzioni['3'] = 'X_X_CCO_CCE_X_X_X_X';
carteAzioni['4'] = 'X_X_CD_CAM_X_X_X_X';
carteAzioni['5'] = 'X_CDM_X_X_X_X';
carteAzioni['6'] = 'X_X_CE_CCO_X_X_X_X';
carteAzioni['7'] = 'X_X_CCO3_CE_X_X_X_X';
carteAzioni['8'] = 'X_X_CE_CCE_X_X_X_X';
carteAzioni['9'] = 'X_X_CD_CAM_X_X_X_X';
carteAzioni['10'] = 'X_X_CE_CD_X_X_X_X';
carteAzioni['11'] = 'X_X_CE_CCE_X_X_X_X';
carteAzioni['12'] = 'X_X_CD_CCO_X_X_X_X';
carteAzioni['13'] = 'X_X_CCE_CD_X_X_X_X';
carteAzioni['14'] = 'X_CD_X_X_X_X';
carteAzioni['15'] = 'X_X_CDC_CCE_X_X_X_X';
carteAzioni['16'] = 'X_X_CCO_X_X_X_X';
carteAzioni['17'] = 'X_X_CD_X_X_X_X';
carteAzioni['18'] = 'X_X_CCE_X_X_X_X';
carteAzioni['19'] = 'X_CCE_CAP_X_X_X_X';
carteAzioni['20'] = 'X_X_CCO4_X_X_X_X';

export const azioni = ['CD', 'CDM', 'CDC', 'CE', 'CCO', 'CCO3', 'CCO4', 'CCE', 'CAP', 'CAM'];

export const deckSize = 20;
/**
 * @type {string[]}
 */
export let mazzo = [];
export let indice = 0;
export let curCartaAzioni = undefined;
export let curCartaCriteri = undefined;

export function resetMazzo() {
    mazzo = [];
    indice = 0;
}

export function initMazzo() {
    for (var i = 0; i < deckSize; i++) {
        mazzo.push('' + (i + 1));
    }
    mescola();
    curCartaAzioni = mazzo[indice];
    curCartaCriteri = indice > 0 ? mazzo[indice - 1] : undefined;
    mostraCarte();
}

export function mescola() {
    let currentIndex = mazzo.length, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [mazzo[currentIndex], mazzo[randomIndex]] = [
            mazzo[randomIndex], mazzo[currentIndex]];
    }
    return mazzo;
}

export function pesca() {
    if (indice >= deckSize) {
        initMazzo();
    }
    indice++;
    curCartaAzioni = mazzo[indice];
    curCartaCriteri = indice > 0 ? mazzo[indice - 1] : undefined;
    mostraCarte();
    mostraAzioni();
}