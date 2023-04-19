// type Policy = {
//   subj: ValidSubject;
//   rels?: {
//     [relName: string]: string | string[];
//   };
//   acts?: {
//     [actName: string]: string | string[];
//   };
// }

import { AndType } from './relation-type/and-type';
import { ChainType } from './relation-type/chain-type';
import { DirectType } from './relation-type/direct-type';
import { OneOfType } from './relation-type/one-of-type';
import { RefType } from './relation-type/ref-type';

export type RelCnf = string | string[];

export type Policy = {
  subj: string;
  rels?: { [relName: string]: RelCnf };
  acts?: { [actName: string]: string | string[] };
};

export type CompliedPolicy = {
  subj: string;
  rels: { [relName: string]: ValidType };
  acts: { [actName: string]: ValidType };
}

export enum Notation {
  AND = '&',
  CHAIN = '>'
}

export type FgaTuple<T extends string = string> = `${T}#${string}@${string}@${T}#${string}`;

export type ParsedTuple = {
  subject: { name: string; id: string };
  relation: string;
  object: { name: string; id: string };
}

export interface IsFulFilledOptions {
  parsedTuple: ParsedTuple;
}

export interface PolicyType {
  isFulFilled(options: IsFulFilledOptions): Promise<boolean>;
}

export type ValidType = DirectType | ChainType | AndType | OneOfType | RefType;