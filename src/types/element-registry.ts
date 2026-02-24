/**
 * Element-Registry TypeScript Definitions
 * Definiert alle Element-Typen für die MindVaults Mind-Mapping App
 */

/**
 * Union-Type aller verfügbaren Element-Typen
 */
export type ElementType =
  | 'note'
  | 'template'
  | 'variable'
  | 'outcome'
  | 'info'
  | 'boolean'
  | 'if'
  | 'for'
  | 'api-call';

/**
 * Port-Definition für Element-Eingänge und -Ausgänge
 */
export interface PortDefinition {
  /** Eindeutige ID des Ports */
  id: string;
  /** Anzeigename des Ports */
  label: string;
  /** Port-Typ: flow für Kontrollfluss, data für Datenaustausch */
  type: 'flow' | 'data';
}

/**
 * Definition eines Element-Typs in der Registry
 */
export interface ElementDefinition {
  /** Element-Typ */
  type: ElementType;
  /** Anzeigename des Elements */
  label: string;
  /** Lucide Icon-Name für die Darstellung */
  icon: string;
  /** Kategorie des Elements */
  category: 'content' | 'logic' | 'integration';
  /** Port-Definitionen für Eingänge und Ausgänge */
  ports: {
    inputs: PortDefinition[];
    outputs: PortDefinition[];
  };
}
