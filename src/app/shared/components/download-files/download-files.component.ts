import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  inject,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationPopupComponent } from '@app/components';
import { filter, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-download-files',
  standalone: true,
  imports: [MatChipsModule, NgFor, MatIconModule, NgIf],
  templateUrl: './download-files.component.html',
})
export class DownloadFilesComponent implements OnDestroy {
  private translateService = inject(TranslateService);
  private dialog = inject(MatDialog);

  //la liste des noms de fichiers
  @Input() files: string[] = [];
  //envoi l'index du fichier
  @Output() download: EventEmitter<number> = new EventEmitter<number>();
  //envoi l'index du fichier
  @Output() delete: EventEmitter<number> = new EventEmitter<number>();

  @Input() readOnly: boolean = false;
  private subscription = new Subscription();

  public confirmDelete(index: number): void {
    const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      data: {
        message: this.translateService.instant('commun.deleteConfirmation'),
        deny: this.translateService.instant('commun.non'),
        confirm: this.translateService.instant('commun.oui'),
      },
      disableClose: true,
    });
    this.subscription.add(
      dialogRef
        .afterClosed()
        .pipe(
          filter((result: boolean) => !!result),
          tap(() => {
            this.delete.emit(index);
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
