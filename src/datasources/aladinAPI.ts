import { RESTDataSource } from "@apollo/datasource-rest";
import { GraphQLError } from "graphql";
import type {
  AladinAPIBookItem,
  AladinAPISearchResponse,
  SearchOption,
  AladinAPIGetBookInfoResponse,
  GetBookInfoItem,
  AladinAPIRecommendBookListResponse,
  RecommendBookIsbnObject,
  RecommendQueryType,
} from "../types/interface/aladinAPI";
import dotenv from "dotenv";

dotenv.config();

export class AladinAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://www.aladin.co.kr/ttb/api/";
  }

  get aladinApiKey(): string {
    return process.env.ALADIN_API_KEY;
  }

  preprocessAndParsing = (
    responseString: string,
  ):
    | AladinAPISearchResponse
    | AladinAPIGetBookInfoResponse
    | AladinAPIRecommendBookListResponse
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | {} => {
    try {
      const cleanedString: string = responseString
        .slice(0, -1)
        .replace(/&amp;/g, "&")
        .replace(/\\(?!["\\/bfnrtu])/g, "")
        .replace(/[\x00-\x1F\x7F]/g, (match) => {
          return "\\u" + ("0000" + match.charCodeAt(0).toString(16)).slice(-4);
        });

      const parsingResponse = JSON.parse(cleanedString);
      return parsingResponse;
    } catch {
      console.log("JS PARSING ERROR");
      return {};
    }
  };

  searchBooks = async (
    searchOption: SearchOption,
  ): Promise<AladinAPIBookItem[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aladinAPISearchResponseString: any = await this.get(
        "ItemSearch.aspx",
        {
          params: {
            ttbkey: this.aladinApiKey,
            Query: searchOption.searchQuery,
            QueryType: searchOption.queryType,
            SearchTarget: "Book",
            Cover: "Big",
            Sort: searchOption.sort,
            MaxResults: searchOption.maxResult,
            output: "JS",
          },
        },
      );

      const aladinAPISearchResponse: AladinAPISearchResponse =
        this.preprocessAndParsing(
          aladinAPISearchResponseString,
        ) as AladinAPISearchResponse;

      return aladinAPISearchResponse?.item ? aladinAPISearchResponse.item : [];
    } catch (err) {
      throw new GraphQLError(err);
    }
  };

  getBookInfo = async (isbn13: string): Promise<GetBookInfoItem> => {
    try {
      const itemID: string = isbn13.replaceAll(" ", "").replaceAll("-", "");
      console.log(itemID);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aladinAPIGetBookInfoResponseString: any = await this.get(
        "ItemLookUp.aspx",
        {
          params: {
            ttbkey: this.aladinApiKey,
            itemID: itemID,
            itemIdType: itemID.length === 13 ? "ISBN13" : "ISBN",
            cover: "Big",
            output: "JS",
          },
        },
      );

      if (aladinAPIGetBookInfoResponseString instanceof Object) {
        throw new GraphQLError(aladinAPIGetBookInfoResponseString.errorMessage);
      }

      const aladinAPIGetBookInfoResponse: AladinAPIGetBookInfoResponse =
        this.preprocessAndParsing(
          aladinAPIGetBookInfoResponseString,
        ) as AladinAPIGetBookInfoResponse;

      return aladinAPIGetBookInfoResponse.item[0];
    } catch (err) {
      throw new GraphQLError(err);
    }
  };

  getBookIsbn13List = async (searchOption: SearchOption): Promise<string[]> => {
    try {
      const bookItemList: AladinAPIBookItem[] =
        await this.searchBooks(searchOption);
      const response: string[] = [];

      for (const i of bookItemList) {
        if (i.isbn13) response.push(i.isbn13);
        else response.push(i.isbn);
      }

      return response;
    } catch (err) {
      throw new GraphQLError(err);
    }
  };

  getRecommendBookList = async (
    queryType: RecommendQueryType,
  ): Promise<RecommendBookIsbnObject> => {
    try {
      const aladinAPIRecommentBookListResponse: AladinAPIRecommendBookListResponse =
        await this.get("ItemList.aspx", {
          params: {
            ttbkey: this.aladinApiKey,
            QueryType: queryType,
            MaxResults: "9",
            SearchTarget: "Book",
            Version: "20131101",
            output: "JS",
          },
        });

      const bookisbn13List: string[] = [];

      for (const i of aladinAPIRecommentBookListResponse.item) {
        bookisbn13List.push(i.isbn13 ? i.isbn13.replace(" ", "") : i.isbn);
      }

      const response: RecommendBookIsbnObject = {
        queryType: queryType,
        isbn13List: bookisbn13List,
      };

      return response;
    } catch (err) {
      throw new GraphQLError(err);
    }
  };
}
