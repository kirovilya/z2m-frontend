export type DeviceType = "EndDevice" | "Router" | "Coordinator";


interface OTAState {
    state: "available" | "updating";
    progress: number;
    remaining: number;
}
export type RGBColor = {
    r: number;
    g: number;
    b: number;
}
export type HueSaturationColor = {
    hue: number;
    saturation: number;
}

export type XYColor = {
    x: number;
    y: number;
}
export type AnyColor = RGBColor | XYColor | HueSaturationColor;
export interface DeviceState {
    battery: number;
    last_seen?: string;
    elapsed?: number;
    linkquality: number;
    update?: OTAState;
    state?: string;
    brightness?: number;
    color_temp?: number;
    color?: AnyColor;
    tilt?: number;
    position?: number;
    [k: string]: string | number | boolean | OTAState | AnyColor;
}

export type Cluster = string;

export type Endpoint = string | number;




export interface Meta {
    revision: number;
    transportrev: number;
    product: number;
    majorrel: number;
    minorrel: number;
    maintrel: number;
}

export interface Coordinator {
    type: string;
    meta: Meta;
}

export interface Network {
    channel: number;
    pan_id: number;
    extended_pan_id: number[];
}
export interface Z2MConfig {
    homeassistant: boolean;
    advanced: {
        elapsed: boolean;
        last_seen: 'disable' | 'ISO_8601' | 'ISO_8601_local' | 'epoch';
        legacy_api: boolean;
    };
    [k: string]: unknown;
}
export interface BridgeConfig {
    version: string;
    commit: string;
    coordinator: Coordinator;
    network: Network;
    log_level: string;
    permit_join: boolean;

}

export interface BridgeInfo {
    config: Z2MConfig;
    permit_join: boolean;
}

export type PowerSource = "Battery" | "Mains (single phase)" | "DC Source";

export type GenericFeatureType = "numeric" | "binary" | "enum" | "json";
export type ComposeiteFeatureType = "light" | "switch" | "cover" | "lock";
export type AllPossibleFeatures = GenericFeatureType & ComposeiteFeatureType;
export type FeatureAccessMode = "r" | "w" | "rw";
export interface GenericExposedFeature {
    type: GenericFeatureType;
    name: string;
    access?: FeatureAccessMode;
    endpoint?: Endpoint;
}

export interface BinaryFeature extends GenericExposedFeature {
    type: "binary";
    value_on: unknown;
    value_off: unknown;
    value_toggle?: unknown;
}
export interface CompositeFeature extends Omit<GenericExposedFeature, "type"> {
    type: ComposeiteFeatureType;
    features: GenericExposedFeature[];
}

export type GenericOrCompositeFeature = GenericExposedFeature & CompositeFeature;

export interface NumericFeature extends GenericExposedFeature {
    type: "numeric";
    unit?: "string";
    value_min?: number;
    value_max?: number;
}

export interface EnumFeature extends GenericExposedFeature {
    type: "enum";
    values: unknown[];
}

export interface JsonFeature extends GenericExposedFeature {
    type: "json";
    schema: object;
}


export interface LightFeature extends  CompositeFeature {
    type: "light";
}

export interface SwitchFeature extends CompositeFeature {
    type: "switch";
}

export interface CoverFeature extends CompositeFeature {
    type: "cover";
}

export interface LockFeature extends Omit<GenericExposedFeature, "type">, CompositeFeature {
    type: "lock";
}

export interface DeviceDefinition {
    description: string;
    model: string;
    supports: string;
    vendor: string;
    exposes: GenericExposedFeature[] | CompositeFeature[];
}

export interface EndpointDescription {
    bindings: BindRule[];
    clusters: {
        input: Cluster[];
        output: Cluster[];
    };
}

export interface Device {
    ieee_address: string;
    type: DeviceType;
    network_address: number;
    model: string;
    friendly_name: string;
    power_source: PowerSource;
    interviewing: boolean;
    interview_completed: boolean;
    software_build_id: number;
    supported: boolean;
    definition?: DeviceDefinition;
    date_code: string;
    endpoints: Map<Endpoint, EndpointDescription>;
}

export type ObjectType = "device" | "group";
export interface BindRule {
    cluster: Cluster;
    target: {
        id?: number;
        endpoint?: Endpoint;
        ieee_address?: string;
        type: "endpoint" | "group";
    };

}
export type SortDirection = "asc" | "desc";

export interface TouchLinkDevice {
    ieee_address: string;
    channel: number;
}