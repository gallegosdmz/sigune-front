import { Content } from "./Content";
import { Option } from "./Option";
import { Script } from "./Script";

export interface ScriptContentOption {
    id: number;
    content: Content;
    script?: Script;
    option?: Option;
}