import {
  Directive,
  Input,
  ViewContainerRef,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NoDataSearchComponent } from '../components/no-data-search/no-data-search.component';

@Directive({
  selector: '[appNoDataSearch]',
  standalone: true,
})
export class NoDataSearchDirective implements OnChanges {
  @Input() data: any[];
  @Input() isSearchClicked: boolean;
  @Input() searchMessage: string;
  @Input() noResultsFoundMessage: string;

  constructor(
    private viewContainer: ViewContainerRef,
    private translateService: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.viewContainer.clear();

      if (this.data?.length) return;

      const message = this.translateService.instant(
        this.isSearchClicked
          ? this.noResultsFoundMessage ?? 'commun.noResultsFound'
          : this.searchMessage ?? 'commun.searchQuestMessage'
      );

      const image = this.isSearchClicked
        ? 'assets/images/not_found.svg'
        : 'assets/images/search.svg';

      const noDataComponent = this.viewContainer.createComponent(
        NoDataSearchComponent
      );
      noDataComponent.setInput('message', message);
      noDataComponent.setInput('image', image);
    }
  }
}
