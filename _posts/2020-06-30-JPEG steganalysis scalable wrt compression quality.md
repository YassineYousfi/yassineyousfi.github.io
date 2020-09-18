---
layout: post
title:  "JPEG steganalysis scalable wrt compression quality"
date:   2020-06-30 23:34:19 -0500
categories: jekyll update
header-img: "media/img/header.png"
author: Yassine
comments: true
---
It has been assumed that when facing multiple JPEG compression quality files (also called quality factor or QF), the best steganalysis tool is one that operates separately on images grouped by QF. Doing so means training a detector for each QF, and there can be virtually infinite QFs (parametrized by an 8x8 quantization table). 

In our new paper published at IS&T International Symposium on Electronic Imaging 2020, we show that the above assumption is not true, and various detectors (CNNs, Feature Based) can yield good detection even when operating on multiple QFs.

We show for example that during the Alaska 1 competition, we could have reduced the number of detectors from 13 to 5, without any loss in performance (probability of error \\( P_E \\)).


<img src="/assets/img/multiqf_SRNET_ALASKA_PE.png" width="70%"/>


Read the print [here](https://www.ws.binghamton.edu/fridrich/Research/scalable_jpeg_steganalysis.pdf){:target="_blank"}.
