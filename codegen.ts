import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schema.graphql",
  generates: {
    "./src/infrastructure/generated/index.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "@interface/context#Context",
        scalars: {
          Void: "void"
        }
      },
    },
  },
};

export default config;
