import Hashids from 'hashids';

const VOTING_HASH_SALT =
  process.env.NEXT_PUBLIC_VOTING_HASH_SALT ?? 'balance-game-v1';
const hashids = new Hashids(VOTING_HASH_SALT, 8);

export const encodeVotingId = (id: number) => hashids.encode(id);

export const decodeVotingId = (hash: string) => {
  const decoded = hashids.decode(hash);
  const id = decoded[0];

  if (typeof id === 'number') {
    return Number.isFinite(id) ? id : null;
  }

  if (typeof id === 'bigint') {
    const asNumber = Number(id);

    return Number.isSafeInteger(asNumber) ? asNumber : null;
  }

  return null;
};
