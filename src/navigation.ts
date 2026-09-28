export type RootStackParamList = {
  Lista: undefined;
  Formulario:
    | {
        id?: number;
        tituloActual?: string;
        calificacionActual?: number;
        comentariosActuales?: string;
      }
    | undefined;
};
