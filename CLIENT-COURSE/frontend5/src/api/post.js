import app from "./axios.js";

export const postApi = {
  store: (data) =>
    app.post("/posts", data, {
      headers: {
        "Content-Type": "multipart/from-data",
      },
    }),
  delete: (id) => app.delete("/posts/" + id),
  getAll: (params) => {
    const { size, page } = params;
   return app.get("/posts", {
      params: {
        page,
        size,
      },
    });
  },
};
