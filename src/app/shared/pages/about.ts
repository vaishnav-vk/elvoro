import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-about',
  styleUrl: './about.css',
  templateUrl: './about.html',
})
export class About {
   values = [
    {
      icon: '✦',
      title: 'Everyday Comfort',
      description: 'Sneaker styles designed around comfort and everyday movement.'
    },
    {
      icon: '◈',
      title: 'Modern Style',
      description: 'Discover footwear that complements your personal style.'
    },
    {
      icon: '✧',
      title: 'Your Identity',
      description: 'Express yourself with confidence, one step at a time.'
    }
  ];
}
