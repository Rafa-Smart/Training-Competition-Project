import { app } from "./axios";

export const apiPost = {
  getAllPosts: (params) => {
    const { size, page } = params;
    return app.get("/posts", {
      params: {
        size,
        page,
      },
    });
  },
  storePost: (data) => app.post("/posts", data, {
    headers:{
        'Content-Type':"multipart/form-data"
    }
  }),
  destroyPost: (id) => app.post("/posts/" + id),
};
