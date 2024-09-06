import { Ciclo } from "./ciclo";
import { Curso } from "./curso";

export interface RelacionCiclo {
    ciclo: Ciclo;
    cursos: Curso[];
}
