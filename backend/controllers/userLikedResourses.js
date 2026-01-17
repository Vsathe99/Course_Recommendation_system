import Interaction from "../models/interaction.js";

export const getLikedItems = async (req, res) => {
  const userId  = req.user.id;

  try {
    const items = await Interaction.aggregate([
      { $match: { user_id: userId, liked: true } },

      {
        $lookup: {
          from: "items",
          localField: "item_id",
          foreignField: "_id",
          as: "item",
        },
      },

      { $unwind: "$item" },

      {
        $project: {
          _id: "$item._id",
          source: "$item.source",
          ext_id: "$item.ext_id",
          title: "$item.title",
          desc: "$item.desc",
          url: "$item.url",
          topic: "$item.topic",
          popularity: "$item.popularity",
          difficulty: "$item.difficulty",
          numeric_id: "$item.numeric_id",
          created_at: "$item.created_at",

          liked: true,
          saved: { $ifNull: ["$saved", false] },
          rating: { $ifNull: ["$rating", null] },
        },
      },

      { $sort: { updated_at: -1 } },
    ]);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch liked items" });
  }
};
