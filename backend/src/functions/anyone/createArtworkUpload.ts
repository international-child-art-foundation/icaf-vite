import {
  ApiGatewayEvent,
  COMMON_HEADERS,
  CommonErrors,
  CreateArtworkUploadRequest,
  HTTP_STATUS,
  S3_MAX_FILE_SIZE_BYTES,
  UPLOAD_FILE_TYPES,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";
import { createArtworkUpload } from "../shared/artworkUpload";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<CreateArtworkUploadRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;

    const { file_type: fileType, file_size_bytes: fileSizeBytes } = parsedBody.value;
    if (!fileType || !(UPLOAD_FILE_TYPES as readonly string[]).includes(fileType)) {
      return CommonErrors.badRequest(`file_type must be one of: ${UPLOAD_FILE_TYPES.join(", ")}`);
    }
    if (!Number.isInteger(fileSizeBytes) || fileSizeBytes < 1) {
      return CommonErrors.badRequest("file_size_bytes must be a positive integer");
    }
    if (fileSizeBytes > S3_MAX_FILE_SIZE_BYTES) {
      return CommonErrors.badRequest(
        `Artwork image must be ${S3_MAX_FILE_SIZE_BYTES} bytes or less`,
      );
    }

    const response = await createArtworkUpload(fileType);

    return {
      statusCode: HTTP_STATUS.CREATED,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error creating artwork upload:", error);
    return CommonErrors.internalServerError();
  }
};
