import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Species, ImageInfo } from '../../../sharedTypes';
import { ApiService } from '../../services/apiService';

@Component({
  selector: 'app-species-info-dialog',
  templateUrl: './speciesInfoDialog.html',
})
export class SpeciesInfoDialogComponent {

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<SpeciesInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      type: string,
      species: Species,
      images: ImageInfo[],
      updated: boolean
    }) {}

    selectImage(image: string): void {
      this.data.species.image = image;
      this.data.type = 'speciesInfo';
      this.data.updated = true;
    }

    close(): void {
      this.dialogRef.close(this.data.updated);
    }

    cancel(): void {
      this.dialogRef.close(false);
    }

    searchImages(taxonomicName: string) {
      const callback = (images: ImageInfo[]) => {
        this.data.type = 'importImages';
        this.data.images = images;
      };
      this.apiService.getImagesForSpecies(taxonomicName, callback);
    }
}
