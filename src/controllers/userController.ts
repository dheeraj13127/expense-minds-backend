export const getProfile = async (req: any, res: any) => {
  try {
    return res.status(200).json({
      status: "success",
      user: req.user,
    });
  } catch (err) {
    return res.status(400).json({ message: "failed to fetch the profile" });
  }
};
