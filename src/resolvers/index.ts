import { Resolvers } from "@generated";
import { userResolvers } from "./user";
import { reviewResolvers } from "./review";
import { feedResolvers } from "./feed";
import { shelfResolvers } from "./shelf";
import { likesResolvers } from "./likes";
import { aladinResolvers } from "./aladin";

const resolvers: Resolvers[] = [
  userResolvers,
  reviewResolvers,
  feedResolvers,
  shelfResolvers,
  likesResolvers,
  aladinResolvers,
];

export default resolvers;
