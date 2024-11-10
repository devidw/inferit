iconsrc := public/inferit.png
icondir := public
iconsizes := {16,24,32,48,128}
iconfiles := $(shell echo $(icondir)/icon_$(iconsizes).png)

$(icondir)/icon_%.png: 
	@mkdir -p $(@D)
	convert $(iconsrc) -resize $* $@

icons: $(iconfiles)
.PHONY: icons