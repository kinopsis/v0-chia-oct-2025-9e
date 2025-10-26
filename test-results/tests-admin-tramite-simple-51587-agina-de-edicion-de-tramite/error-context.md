# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e7]
      - generic [ref=e11]: Backoffice Chía
      - generic [ref=e12]: Ingresa con tu cuenta de funcionario municipal
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: Correo electrónico
        - textbox "Correo electrónico" [ref=e17]:
          - /placeholder: tu.nombre@chia.gov.co
      - generic [ref=e18]:
        - generic [ref=e19]: Contraseña
        - textbox "Contraseña" [ref=e20]:
          - /placeholder: ••••••••
      - button "Iniciar sesión" [ref=e21]
      - link "Volver al portal ciudadano" [ref=e23] [cursor=pointer]:
        - /url: /
  - button "Open Next.js Dev Tools" [ref=e29] [cursor=pointer]:
    - img [ref=e30]
  - alert [ref=e33]
```