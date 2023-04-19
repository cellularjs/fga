import { ParsedTuple, FgaTuple } from './fga-type';

export function parseFgaTuple(tupleStr: FgaTuple): ParsedTuple {
  const tuple = tupleStr.split('@');
  if (tuple.length !== 3) {
    throw new Error('Invalid tuple string')
  }

  const [subject, action, object] = tuple;
  const [subjName, subjId] = subject.split('#');
  const [objName, objId] = object.split('#');

  if (!subjName) {
    throw new Error('Subject name is empty');
  }

  if (!subjId) {
    throw new Error('Subject id is empty');
  }

  if (!objName) {
    throw new Error('Object name is empty');
  }

  if (!objId) {
    throw new Error('Object id is empty');
  }

  return {
    subject: { name: subjName, id: subjId },
    relation: action,
    object: { name: objName, id: objId },
  };
}
