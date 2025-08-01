import { Resolvers } from "@generated";
import { userResolvers } from "./user";
import { reviewResolvers } from "./review";
import { feedResolvers } from "./feed";
import { shelfResolvers } from "./shelf";
import { likesResolvers } from "./likes";
import { aladinResolvers } from "./aladin";
import { aiRecommendationResolvers } from "./ai-recommendation";
import { libraryResolvers } from "./library";

const resolvers: Resolvers[] = [
  userResolvers,
  reviewResolvers,
  feedResolvers,
  shelfResolvers,
  likesResolvers,
  aladinResolvers,
  aiRecommendationResolvers,
  libraryResolvers,
];

export default resolvers;
