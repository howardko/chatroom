import { string } from "fp-ts";
import { boolean } from "fp-ts-std";
import {CommandTypes} from "./command-type";

export interface Command {
    type: string;
    to: string;
    message: string;
  }