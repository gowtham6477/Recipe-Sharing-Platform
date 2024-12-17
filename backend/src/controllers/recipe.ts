import { UploadedFile } from "express-fileupload";
import { Request, Response } from "express";
import { Recipe } from "../model";
import { validateImageType } from "../utils";
import { upload } from "../cloudinary";
import { SEARCH_RECIPES, SEARCH_RECIPES_RESPONSE } from "./../@types/index.d";

export const searchRecipe = async (req: Request, res: Response) => {
  const { q } = req.query;

  try {
    const pipeline = [
      {
        $search: {
          index: "recipe",
          text: {
            query: q,
            path: {
              wildcard: "*",
            },
            fuzzy: {},
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          user: 1,
          note: 1,
          description: 1,
          title: 1,
          ingredients: 1,
          image: 1,
        },
      },
    ];

    const recipes: SEARCH_RECIPES[] = await Recipe.aggregate(pipeline)
      .sort({ _id: -1 })
      .exec();

    let response: SEARCH_RECIPES_RESPONSE[] = [];

    if (recipes.length) {
      response = recipes.map((recipe: SEARCH_RECIPES) => {
        const { user, ...rest } = recipe;
        const email = user[0].email;
        return { ...rest, user: email };
      });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured while processing your request" });
  }
};
