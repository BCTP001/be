import { RESTDataSource } from "@apollo/datasource-rest";
import type {
  AladinAPIBookItem,
  AladinAPISearchResponse,
  SearchOption,
  AladinAPIGetBookInfoResponse,
  GetBookInfoItem,
  AladinAPIRecommendBookListResponse,
  RecommendBookIsbnObject,
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
    } catch(err) {
      console.log(err);
      console.log("JS PARSING ERROR");
      return {}
    }
  };

  searchBooks = async (
    searchOption: SearchOption,
  ): Promise<AladinAPIBookItem[]> => {
    try {
      const aladinAPISearchResponseString: string = await this.get(
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

      return aladinAPISearchResponse.item;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch books from Aladin API");
    }
  };

  getBookInfo = async (isbn13: string): Promise<GetBookInfoItem> => {
    try {
      const aladinAPIGetBookInfoResponseString: string = await this.get(
        "ItemLookUp.aspx",
        {
          params: {
            ttbkey: this.aladinApiKey,
            itemID: isbn13,
            itemIdType:
              isbn13.replace(" ", "").length === 13 ? "ISBN13" : "ISBN",
            cover: "Big",
            output: "JS",
          },
        },
      );

      const aladinAPIGetBookInfoResponse: AladinAPIGetBookInfoResponse =
        this.preprocessAndParsing(
          aladinAPIGetBookInfoResponseString,
        ) as AladinAPIGetBookInfoResponse;

      return aladinAPIGetBookInfoResponse.item[0];
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch books from Aladin API");
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
      console.log(err);
      throw new Error("Failed to fetch books from Aladin API");
    }
  };

  getRecommendBookList = async (): Promise<RecommendBookIsbnObject> => {
    try {
      // ItemNewAll : 신간 리스트
      // ItemNewSpecial : 주목할 만한 신간 리스트
      // Bestseller : 베스트셀러
      // BlogBest : 블로거 베스트셀러

      const queryTypeList: string[] = [
        "ItemNewAll",
        "ItemNewSpecial",
        "Bestseller",
        "BlogBest",
      ];

      const queryType: string = queryTypeList[Math.floor(Math.random() * 4)];

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
      console.log(err);
      throw new Error("Failed to fetch books from Aladin API");
    }
  };
}
