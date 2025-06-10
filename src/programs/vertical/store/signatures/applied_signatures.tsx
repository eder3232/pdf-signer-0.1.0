import { atom } from "jotai";
import { produce } from "immer";
import { CatalogSignature } from "./signatures_catalog";

// Interfaz para la configuración de aleatoriedad
export interface RandomnessConfig {
  positionXVariance: number; // variación en X (porcentaje)
  positionYVariance: number; // variación en Y (porcentaje)
  rotationVariance: number; // variación en rotación (grados)
  opacityVariance: number; // variación en opacidad (porcentaje)
  widthVariance: number; // variación en ancho (centímetros)
}

// Configuración de aleatoriedad por defecto
export const defaultRandomnessConfig: RandomnessConfig = {
  positionXVariance: 2.5,
  positionYVariance: 2.5,
  rotationVariance: 2.5,
  opacityVariance: 2.5,
  widthVariance: 0,
};

export interface SignatureConfig {
  x: number; // posición X en porcentaje
  y: number; // posición Y en porcentaje
  width: number; // ancho en centímetros
  rotation: number; // rotación en grados
  opacity: number; // opacidad en porcentaje
  randomness: RandomnessConfig; // configuración de aleatoriedad
}

export const defaultSignatureConfig: SignatureConfig = {
  x: 50,
  y: 50,
  width: 5, // valor predeterminado de 5cm
  rotation: 0,
  opacity: 100,
  randomness: defaultRandomnessConfig,
};

export interface AppliedSignature {
  id: string;
  sourceSignature: CatalogSignature;
  config: SignatureConfig;
  isConfigured: boolean;
}

interface AppliedSignaturesState {
  signatures: AppliedSignature[];
  activeSignatureId: string | null;
}

const initialState: AppliedSignaturesState = {
  signatures: [],
  activeSignatureId: null,
};

// Átomo principal para firmas aplicadas
export const appliedSignaturesPrimitiveAtom =
  atom<AppliedSignaturesState>(initialState);

export const appliedSignaturesAtom = atom((get) => {
  const state = get(appliedSignaturesPrimitiveAtom);
  return state.signatures;
});

// Átomo derivado para la firma activa
export const activeSignatureAtom = atom((get) => {
  const state = get(appliedSignaturesPrimitiveAtom);
  return state.signatures.find((sig) => sig.id === state.activeSignatureId);
});

// Átomo derivado para verificar si todas las firmas están configuradas
export const allSignaturesConfiguredAtom = atom((get) => {
  const state = get(appliedSignaturesPrimitiveAtom);
  return (
    state.signatures.length > 0 &&
    state.signatures.every((sig) => sig.isConfigured)
  );
});

// Interfaces para las acciones
export interface AddSignatureAction {
  type: "ADD";
  payload: CatalogSignature;
}

export interface RemoveSignatureAction {
  type: "REMOVE";
  payload: string;
}

export interface UpdateConfigAction {
  type: "UPDATE_CONFIG";
  payload: {
    id: string;
    config: Partial<
      SignatureConfig | { randomness: Partial<RandomnessConfig> }
    >;
  };
}

export interface SetActiveAction {
  type: "SET_ACTIVE";
  payload: string | null;
}

export interface ClearAllAction {
  type: "CLEAR_ALL";
  payload: null;
}

export interface SetConfiguredAction {
  type: "SET_CONFIGURED";
  payload: {
    id: string;
    isConfigured: boolean;
  };
}

export type SignatureAction =
  | AddSignatureAction
  | RemoveSignatureAction
  | UpdateConfigAction
  | SetActiveAction
  | ClearAllAction
  | SetConfiguredAction;

// Funciones específicas para cada acción
const handleAddSignature = (
  state: AppliedSignaturesState,
  sourceSignature: CatalogSignature,
): AppliedSignaturesState => {
  return produce(state, (draft) => {
    draft.signatures.push({
      id: sourceSignature.id,
      sourceSignature,
      config: defaultSignatureConfig,
      isConfigured: false,
    });
  });
};

const handleRemoveSignature = (
  state: AppliedSignaturesState,
  idToRemove: string,
): AppliedSignaturesState => {
  return produce(state, (draft) => {
    draft.signatures = draft.signatures.filter((sig) => sig.id !== idToRemove);
    if (draft.activeSignatureId === idToRemove) {
      draft.activeSignatureId = null;
    }
  });
};

const handleUpdateConfig = (
  state: AppliedSignaturesState,
  payload: {
    id: string;
    config: Partial<
      SignatureConfig | { randomness: Partial<RandomnessConfig> }
    >;
  },
): AppliedSignaturesState => {
  return produce(state, (draft) => {
    const signature = draft.signatures.find((sig) => sig.id === payload.id);
    if (signature) {
      if ("randomness" in payload.config) {
        // Si estamos actualizando la configuración de aleatoriedad
        signature.config.randomness = {
          ...signature.config.randomness,
          ...payload.config.randomness,
        };
      } else {
        // Actualizando otras propiedades de configuración
        Object.assign(signature.config, payload.config);
      }
      signature.isConfigured = true;
    }
  });
};

const handleSetActive = (
  state: AppliedSignaturesState,
  id: string | null,
): AppliedSignaturesState => {
  return produce(state, (draft) => {
    draft.activeSignatureId = id;
  });
};

const handleClearAll = (): AppliedSignaturesState => {
  return initialState;
};

const handleSetConfigured = (
  state: AppliedSignaturesState,
  payload: { id: string; isConfigured: boolean },
): AppliedSignaturesState => {
  return produce(state, (draft) => {
    const signature = draft.signatures.find((sig) => sig.id === payload.id);
    if (signature) {
      signature.isConfigured = payload.isConfigured;
    }
  });
};

// Átomos individuales para cada acción
export const addSignatureAtom = atom(
  null,
  (get, set, sourceSignature: CatalogSignature) => {
    const state = get(appliedSignaturesPrimitiveAtom);
    set(
      appliedSignaturesPrimitiveAtom,
      handleAddSignature(state, sourceSignature),
    );
  },
);

export const removeSignatureAtom = atom(
  null,
  (get, set, idToRemove: string) => {
    const state = get(appliedSignaturesPrimitiveAtom);
    set(
      appliedSignaturesPrimitiveAtom,
      handleRemoveSignature(state, idToRemove),
    );
  },
);

export const updateConfigAtom = atom(
  null,
  (
    get,
    set,
    payload: {
      id: string;
      config: Partial<
        SignatureConfig | { randomness: Partial<RandomnessConfig> }
      >;
    },
  ) => {
    const state = get(appliedSignaturesPrimitiveAtom);
    set(appliedSignaturesPrimitiveAtom, handleUpdateConfig(state, payload));
  },
);

export const setActiveSignatureAtom = atom(
  null,
  (get, set, id: string | null) => {
    const state = get(appliedSignaturesPrimitiveAtom);
    set(appliedSignaturesPrimitiveAtom, handleSetActive(state, id));
  },
);

export const clearAllSignaturesAtom = atom(null, (_get, set) => {
  set(appliedSignaturesPrimitiveAtom, handleClearAll());
});

export const setSignatureConfiguredAtom = atom(
  null,
  (get, set, payload: { id: string; isConfigured: boolean }) => {
    const state = get(appliedSignaturesPrimitiveAtom);
    set(appliedSignaturesPrimitiveAtom, handleSetConfigured(state, payload));
  },
);

// Átomo compuesto que agrupa todas las acciones
export const appliedSignaturesActionsAtom = atom(
  null,
  (_get, set, action: SignatureAction) => {
    switch (action.type) {
      case "ADD":
        set(addSignatureAtom, action.payload);
        break;
      case "REMOVE":
        set(removeSignatureAtom, action.payload);
        break;
      case "UPDATE_CONFIG":
        set(updateConfigAtom, action.payload);
        break;
      case "SET_ACTIVE":
        set(setActiveSignatureAtom, action.payload);
        break;
      case "CLEAR_ALL":
        set(clearAllSignaturesAtom);
        break;
      case "SET_CONFIGURED":
        set(setSignatureConfiguredAtom, action.payload);
        break;
    }
  },
);
