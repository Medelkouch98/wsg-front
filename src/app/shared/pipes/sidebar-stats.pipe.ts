import { Pipe, PipeTransform } from '@angular/core';
import { ISidebarState } from '../models';

@Pipe({ name: 'sidebarStats', standalone: true })
export class SidebarStatsPipe implements PipeTransform {
  constructor() {}
  /**
   * Récupérer stats par state
   * @param state string
   * @return ISidebarState
   */
  transform(stats: ISidebarState[], ...args: [string]): ISidebarState {
    const [state] = args;
    return stats.find((stat: ISidebarState) => stat.state === state);
  }
}
