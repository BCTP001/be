## Usage

***First of all***, configure your `.env` file in the project root directory as follows:
1. Get an [Aladin OpenAPI key](https://www.aladin.co.kr/ttb/wblog_manage.aspx).
1. Add a line as follows:
    ```
    ALADIN_API_KEY=<your key here>
    ```

***To use this server:***
- Use `./run.sh` to run a server. (Check available options by `./run.sh --help`)
- Use `./down.sh` to stop the server.
- Use `./reset-all.sh` to reset the database and `node_modules` if needed.
