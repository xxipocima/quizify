import {Component, OnInit} from '@angular/core';
import { IconNamesEnum} from 'ngx-bootstrap-icons';
import {AuthService} from "../../shared/auth/auth.service";

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.sass']
})
export class PackageComponent implements OnInit{
  constructor(private authService: AuthService) { }

  isLoading: Boolean = false;
  packages: any[] = [
    {
      title: 'Package 1',
      subtitle: "Give you access to advanced Test.",
      attempts: "10 attempts to get Tests",
      cost: "100",
      buttonText: "Purchase",
      icon: "check2",
      background: "https://picsum.photos/id/533/900/500",
    },
    {
      title: 'Package 2',
      subtitle: "Give you access to advanced Test.",
      attempts: "20 attempts to get Tests",
      cost: "180",
      buttonText: "Purchase",
      icon: "check2-circle",
      background: "https://picsum.photos/id/500/900/500",
    },
  ];

  iconNames = IconNamesEnum;

  ngOnInit() {
    this.isLoading = true;

    this.isLoading = false;
  }
  get isAdmin() {
    return this.authService.isAdmin;
  }
}
