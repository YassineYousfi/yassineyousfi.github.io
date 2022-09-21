---
layout: page
title: Research
permalink: /research/
description: My research interests.
nav: true
---

## End-to-end learning of a driving planner

My research focus at comma.ai is to learn driving (lateral and longitudinal planner) from data, in an end-to-end fashion.

More here soon. In the meantime checkout [comma's blog](https://blog.comma.ai/){:target="_blank"}

## Machine Learning and Multimedia Security

My PhD thesis focused on the application of Machine Learning and Deep Learning in **Steganography** and **Steganalysis**. 

Steganography is the art of covert communication when secrets are hidden in ordinary looking cover objects. The goal is to make steganographic communication indistinguishable from regular exchange of information during which no secrets are passed between communicating parties.

Digital media, such as images, are particularly suitable cover objects because of their ubiquity and because they can be slightly modified without changing their appearance, potentially thus able to hold large messages. The task of detecting the presence of steganography is complicated by the fact that images contain many indeterministic components due to the acquisition conditions and to the high diversity and complexity introduced during development from the raw capture, post-processing, editing, and even sharing.

The steganography/steganalysis problem is often described by the prisoners' problem, Alice and Bob are allowed to communicate but all messages they exchange are closely monitored by warden Eve looking for potential hidden data in their communication.

The image below is a stego image (14997 from BOSS[^1]+BOWS2[^2] dataset embedded using the HILL[^3] stego algorithm). Hover on the image to see the pixels changed by the embedding scheme. Most changes are made in areas with complex content, while avoiding areas with smooth content. This is called content-adaptive steganography.

<div class="magnifier" style="width: 400px; height: 400px">
  <img class="magsmall" src="/assets/img/stego_example.png" alt="Stego" />
  <div class="maglens" style="width:75px; height:75px">
    <img class="maglarge" src="/assets/img/stego_changes_example.png" alt="Stego changes"
     style="width: 400px; height: 400px" />
  </div>
</div>

----------

#### References

[^1]: Bas, Patrick, Tomáš Filler, and Tomáš Pevný. "Break our steganographic system: the ins and outs of organizing BOSS." International workshop on information hiding. Springer, Berlin, Heidelberg, 2011.
[^2]: [https://bows2.ec-lille.fr/](http://bows2.ec-lille.fr/){:target="_blank"}
[^3]: Li, Bin, et al. "A new cost function for spatial image steganography." 2014 IEEE International Conference on Image Processing (ICIP). IEEE, 2014.