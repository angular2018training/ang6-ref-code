import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from '@angular/router';
import * as _ from "lodash";
import { VARIABLES, MENUS_OF_ROLE, PAGES, TITLE_OBJ} from 'app/constant';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  private isHover = false;
  private isHoverSubmenu = false;

  selectedMenu = {};
  private selectedSubmenu;
  private cacheSelected;

  private currentUrl;
  title = '';

  titleObj = TITLE_OBJ.TITLE_OBJ;

  parentObj = TITLE_OBJ.PARRENT_OBJ;

  menu;

  constructor(private route: ActivatedRoute, private router: Router, private _LoginService: LoginService) {
    this.router.events
      .subscribe((event) => {
        // if (event['error'] != undefined) {
        //   return this._LoginService.checkLogin(event) && this._LoginService.checkPermission(event['url']);
        //   // console.log(event['error']);
        // }
        // if (event instanceof NavigationStart) {
        //   console.log();
        // }
        if (event instanceof NavigationEnd) {
          // get title of current page
          if (!this.currentUrl || this.currentUrl === '/') {
            this.currentUrl = event.urlAfterRedirects;
            this.initMenu();
          } else {
            //remove param
            if (event.url.indexOf("?") > -1) {
              event.url = event.url.substring(0, event.url.indexOf("?"))
            }
            this.currentUrl = event.url;
            this.initMenu();
          }
          this.title = this.titleObj[this.currentUrl];
        }
      });
  }

  initMenu() {
    let idxSubmenu = 0,
      currentUrl = this.currentUrl,
      parentObj = this.parentObj,
      currentState = _.find(this.menu, function (menu) {
        if (menu['url']) {
          return menu['url'] === currentUrl || menu['url'] === parentObj[currentUrl];
        } else {
          let subMenuIdx = _.findIndex(menu['pages'], (submenu) => {
            return submenu['url'] === currentUrl || submenu['url'] === parentObj[currentUrl];
          });
          if (subMenuIdx !== -1) {
            idxSubmenu = subMenuIdx;
            return true;
          }
        }
      });
    if (currentState) {
      this.selectedMenu = _.cloneDeep(currentState);
      this.selectedSubmenu = this.selectedMenu['pages'] && this.selectedMenu['pages'][idxSubmenu];
      this.cacheSelectedMenu();
    }
  }

  ngOnInit() {
    // this.currentUrl = window.location.pathname;
    // this.title = this.titleObj[this.currentUrl];
    this.currentUrl = window.location.href.split('#')[1];
    this.title = this.titleObj[this.currentUrl];
    
    let role = this._LoginService.getUserInfo().role;
    if (role === VARIABLES.OPERATOR) {
      this.menu = MENUS_OF_ROLE.MENU_FOR_OPERATOR;
    } else if (role === VARIABLES.CUSTOMER) {
      this.menu = MENUS_OF_ROLE.MENU_FOR_CUSTOMER
    }
    this.initMenu();
  }

  showState(item, $mdOpenMenu, event) {
    if (typeof (item.url) !== 'undefined' && item.url.length) {
      if (item.icon) {
        this.selectedMenu = _.cloneDeep(item);
        this.selectedSubmenu = {};
      } else {
        this.selectedSubmenu = _.cloneDeep(item);
      }
      this.router.navigate([item.url]);
    } else {
      this.selectedMenu = _.cloneDeep(item);
      this.selectedSubmenu = _.cloneDeep(item.pages[0]);
      this.router.navigate([this.selectedSubmenu.url]);
    }
    this.cacheSelectedMenu();
  }

  cacheSelectedMenu() {
    this.cacheSelected = {
      menu: _.cloneDeep(this.selectedMenu),
      submenu: _.cloneDeep(this.selectedSubmenu),
    };
  }

  hoverMenu(item, event) {
    item.isHover = true;
    this.selectedMenu = _.cloneDeep(item);
  }

  leaveMenu(item, event) {
    setTimeout(() => {
      item.isHover = false;
      if (!this.isHoverMenu()) {
        this.refreshMenu();
      }
    }, 100);
  }

  refreshMenu() {
    if (!this.cacheSelected) {
      return;
    }
    this.selectedMenu = this.cacheSelected.menu;
    this.selectedSubmenu = this.cacheSelected.submenu;
  }

  hoverSubmenu() {
    if (this.isHoverMenu()) {
      this.isHoverSubmenu = true;
    }
  }
  leaveSubmenu() {
    this.isHoverSubmenu = false;
    if (!this.isHoverMenu()) {
      this.refreshMenu();
    }
  }

  isHoverMenu() {
    let index = _.findIndex(this.menu, { isHover: true });
    return index !== -1 || this.isHoverSubmenu;
  }
}