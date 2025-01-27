import { RESTDataSource } from "@apollo/datasource-rest";
import type {
  AladinAPIBookItem,
  AladinAPISearchResponse,
  SearchOption,
  AladinAPIGetBookInfoResponse,
  GetBookInfoItem,
} from "../types/interface/aladinAPI";
import dotenv from "dotenv";

dotenv.config();

// aladinApiBaseUrl: string = 'https://www.aladin.co.kr/ttb/api/ItemList.aspx';
// aladinApiSearchUrl: string = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
// aladinApiLookUpUrl: string = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx';

export class AladinAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://www.aladin.co.kr/ttb/api/";
  }

  get aladinApiKey(): string {
    return process.env.ALADIN_API_KEY;
  }

  preprocessAndParsing(responseString: string): AladinAPISearchResponse | AladinAPIGetBookInfoResponse {
    const cleanedString: string = responseString
        .slice(0, -1)
        .replace(/&amp;/g, "&")
        .replace(/\\(?!["\\/bfnrtu])/g, "");
    const parsingResponse = JSON.parse(cleanedString);

    return parsingResponse;
  }

  async searchBooks(searchOption: SearchOption): Promise<AladinAPIBookItem[]> {
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
      this.preprocessAndParsing(aladinAPISearchResponseString) as AladinAPISearchResponse;

      return aladinAPISearchResponse.item;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch books from Aladin API");
    }
  }

  async getBookInfo(isbn13: string): Promise<GetBookInfoItem> {
    try {
      const aladinAPIGetBookInfoResponseString: string = await this.get(
        "ItemLookUp.aspx",
        {
          params: {
            ttbkey: this.aladinApiKey,
            itemID: isbn13,
            itemIdType: (isbn13.length === 13) ? "ISBN13": "ISBN",
            cover: "Big",
            output: "JS",
          },
        },
      );

      const aladinAPIGetBookInfoResponse: AladinAPIGetBookInfoResponse =
      this.preprocessAndParsing(aladinAPIGetBookInfoResponseString) as AladinAPIGetBookInfoResponse;
      
      return aladinAPIGetBookInfoResponse.item[0];
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch books from Aladin API");
    }
  }

  async getBookIsbn13List(searchOption: SearchOption): Promise<string[]> {
    try {
      const bookItemList: AladinAPIBookItem[] = await this.searchBooks(searchOption);
      const response: string[] = [];

      for (var i of bookItemList){
        if (i.isbn13) response.push(i.isbn13);
        else response.push(i.isbn);
      }

      return response;
    } catch(err){
      console.log(err);
      throw new Error("Failed to fetch books from Aladin API")
    }
  }
}