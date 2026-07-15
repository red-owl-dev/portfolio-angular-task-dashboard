import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss'],
})
export class Shell {}
