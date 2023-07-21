import { CompliedPolicy, Notation, Policy, FgaTuple, RelCnf, ValidType } from './fga-type';
import { parseFgaTuple } from './helper';
import { AndType } from './relation-type/and-type';
import { ChainType } from './relation-type/chain-type';
import { DirectType } from './relation-type/direct-type';
import { OneOfType } from './relation-type/one-of-type';
import { RefType } from './relation-type/ref-type';

export class FGA {
  public compiledPolicies = new Map<string, CompliedPolicy>();
  public rawPolicies: Policy[] = [];

  load(policies: Policy[]) {
    this.rawPolicies = policies;

    policies.forEach(policy => {
      this.compiledPolicies.set(policy.subj, {
        rels: this.detectType(policy, policy.rels),
        subj: policy.subj,
      });
    });

    console.log('Loaded policies: ', Array.from(this.compiledPolicies.values()));
  }

  async can(tupleStr: FgaTuple) {
    console.log('Can:', tupleStr)
    const parsedTuple = parseFgaTuple(tupleStr);
    const { object, relation } = parsedTuple;

    const subjPolicy = this.compiledPolicies.get(object.name);
    if (!subjPolicy) {
      throw new Error(`There is no policy for "${object.name}"`);
    }

    const relCnf = subjPolicy.rels[relation];
    if (!relCnf) {
      throw new Error(`There is no action named "${relation}" inside subject "${object.name}"`);
    }

    await relCnf.isFulFilled({ parsedTuple });
  }

  private classifyRel(policy: Policy, relCnf: RelCnf, rel: string): ValidType {
    if (Array.isArray(relCnf)) {
      return new OneOfType(this, policy, relCnf.map(cnf => this.classifyRel(policy, cnf, rel)));
    }

    const andTypes = relCnf.split(Notation.AND);
    if (andTypes.length > 1) {
      return new AndType(this, policy, andTypes.map(andType => this.classifyRel(policy, andType, rel)));
    }

    const chains = relCnf.split(Notation.CHAIN);
    if (chains.length > 1) {
      return new ChainType(this, policy, chains);
    }

    if (!this.compiledPolicies.has(relCnf)) {
      return new RefType(this, policy, relCnf, rel);
    }

    return new DirectType(this, policy, relCnf, rel);
  }

  private detectType(policy: Policy, rels?: { [k: string]: RelCnf }) {
    if (!rels) return {};

    return Object.keys(rels).reduce((prev, rel) => {
      const relCnfs = rels[rel];

      return { ...prev, [rel]: this.classifyRel(policy, relCnfs, rel) };
    }, {});
  }
}