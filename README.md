# overview

Cavas2D と WebGL を統合し、テキストのレンダリングを行いました。

This project involves creating a visually dynamic slideshow using a combination of WebGL and Canvas2D for text rendering.

# reference

- [kirifuda](https://kirifuda.co.jp/)
- [canvas2D text](https://www.asobou.co.jp/blog/web/canvas-text)
- [shock-wave](https://discourse.threejs.org/t/impact-shock-wave/5988/9)
- [canvasTexture](https://threejs.org/docs/#api/en/textures/CanvasTexture)
- [kirifuda-effect](https://nemutas.github.io/r3f-kirifuda/)

# deploy

- [kirifuda-effect](https://kirifuda-interaction-challenge.vercel.app/)

![image](https://github.com/user-attachments/assets/ec915641-a074-499c-b151-35912b6b7e50)

# comment

- 無限に循環するスライドショーに webgl でエフェクトを追加。canvas2d と material を組み合わせて、インタラクションを作りました。  
- Canvas2D 内での文字間隔の調整やスクロール感度の調整に苦労しました。

- I added WebGL effects to an infinitely looping slideshow.
- I created interactions by Canvas 2D and Three.js material. 
- I struggled with adjusting character spacing within Canvas 2D and fine-tuning scroll sensitivity.
