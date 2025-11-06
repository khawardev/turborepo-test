import { atom } from "jotai";

export const countAtom = atom(0);
countAtom.debugLabel = 'countAtom'
export const userProfileAtom = atom<any>({
    name: "John Doe",
    age: 30,
    email: "john.doe@example.com",
});
userProfileAtom.debugLabel = 'userProfileAtom'
