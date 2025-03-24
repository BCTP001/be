import { Resolvers } from "@generated";
import { userResolvers } from "./user";
import { reviewResolvers } from "./review";
import { feedResolvers } from "./feed";
import { shelfResolvers } from "./shelf";
import { aladinResolvers } from "./aladin";

const resolvers: Resolvers[] = [
  userResolvers,
  reviewResolvers,
  feedResolvers,
  shelfResolvers,
  aladinResolvers,
];

export default resolvers;
