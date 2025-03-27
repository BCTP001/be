export type Id = number;
export type Username = string;
export type Name = string;
export type ProfilePic = string;
export type Bio = string;
export type HashedPw = string;
export type User = {
  id: Id;
  username: Username;
  name: Name;
  profilePic: ProfilePic;
  bio: Bio;
  hashedPw: HashedPw;
};
