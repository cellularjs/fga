import { FGA } from '../fga';
import { IsFulFilledOptions, Policy, PolicyType } from '../fga-type';
import { DirectType } from './direct-type';
import { RefType } from './ref-type';

export class ChainType implements PolicyType {
  constructor(
    private fga: FGA,
    private policy: Policy,
    public readonly chains: string[],
  ) { }

  async isFulFilled(options: IsFulFilledOptions): Promise<boolean> {
    const { fga, policy, chains } = this;
    // console.log('ChainType:', chains.join('>'), policy)
    const compiledPolicy = fga.compiledPolicies.get(policy.subj);
    const { parsedTuple } = options;
    const { subject, relation, object } = parsedTuple;

    if (!compiledPolicy) {
      throw new Error(`There is no subject name "${policy.subj}"`)
    }

    const firstRel = chains[0];
    const remainChains = chains.slice(1);
    const relType = compiledPolicy.rels[firstRel];

    if (!relType) {
      throw new Error(`There is no relation name "${firstRel}" in subject ${policy.subj}`);
    }

    const isRecursive = relType instanceof DirectType
      ? relType.rel === policy.subj
      : relType instanceof RefType
        ? relType.ref === policy.subj
        : false;

    if (isRecursive && relType instanceof DirectType) {
      console.log(`> ChainType: make simple query to find out ${relType?.relCnf} ID (${relType.rel}) and then run recursive`, relType)
      return false;
    }

    if (isRecursive && relType instanceof RefType) {
      // console.log('2')
      console.log(`> ChainType: make simple query to find out ${relType?.ref} ID (${relType.rel}) and then run recursive`);
      const newChainType = new ChainType(fga, policy, remainChains);

      return await newChainType.isFulFilled(options);
    }

    // // subject, relation, object 
    if (relType instanceof DirectType) {
      const rawPolicy = fga.rawPolicies.find(pol => pol.subj === relType.relCnf);
      console.log(`> x3 ChainType: make simple query to find "${relType.rel}" of "${subject.name}"`);
      if (!rawPolicy) throw new Error(`There is no subject name "${relType.relCnf}"`);
      const newChainType = new ChainType(fga, rawPolicy, remainChains);
      return await newChainType.isFulFilled(options);
    }

    // one of type, ...
    return relType.isFulFilled(options);
  }
}