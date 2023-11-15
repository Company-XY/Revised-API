import B2 from "backblaze-b2";

const b2 = new B2({
  accountId: "73966b164200",
  applicationKey: "005f8abcbbab839ef7ca7b2baeb909b0eadecffaeb",
});

b2.authorize()
  .then(() => {})
  .catch((err) => {
    console.error("Failed to authorize with Backblaze B2:", err);
  });

async function uploadToBackblazeB2(file) {
  const fileId = "generated_file_id";
  const url = `https://f001.backblazeb2.com/file/AssistTrial/${fileId}`;

  return { url, fileId };
}

export { uploadToBackblazeB2 };
