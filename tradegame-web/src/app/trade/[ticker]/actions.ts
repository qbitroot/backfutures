"use server";
export async function subscribeEmail(formData: FormData) {
  const auth =
    "Basic " +
    Buffer.from(
      process.env.LISTMONK_LOGIN + ":" + process.env.LISTMONK_PASSWORD
    ).toString("base64");

  try {
    const response = await fetch(process.env.LISTMONK_API_URL ?? "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({
        email: formData.get("email"),
        status: "enabled",
        lists: [parseInt(process.env.LISTMONK_LIST_ID ?? "1")],
      }),
    });
  } catch (error) {
    console.error("Error creating subscriber:", error);
  }
}
