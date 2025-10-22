import { ApiProperty } from '@nestjs/swagger';

export class FaceClusterDto {
  @ApiProperty({
    description: 'Unique identifier for the face cluster',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Optional label for the cluster (e.g., "Bride", "Groom")',
    example: 'Bride',
    required: false,
  })
  label: string | null;

  @ApiProperty({
    description: 'Number of faces in this cluster',
    example: 15,
  })
  faceCount: number;

  @ApiProperty({
    description: 'URL of a sample photo for thumbnail display',
    example: 'https://res.cloudinary.com/example/image.jpg',
    required: false,
  })
  thumbnailUrl: string | null;

  @ApiProperty({
    description: 'Array of photo IDs containing faces from this cluster',
    type: [Number],
    example: [1, 3, 5, 7, 9],
  })
  photoIds: number[];
}
