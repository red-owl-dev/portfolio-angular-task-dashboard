import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  templateUrl: './summary-card.html',
  styleUrls: ['./summary-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCard {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
}
